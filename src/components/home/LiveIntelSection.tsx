import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import SellerPostCard from "@/components/SellerPostCard";
import { safeArray } from "@/lib/utils";

interface LiveIntelSectionProps {
  globalPosts: any[];
}

export const LiveIntelSection = React.memo(function LiveIntelSection({ globalPosts }: LiveIntelSectionProps) {
  if (globalPosts.length === 0) return null;

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight text-foreground flex items-center gap-3">
            Live <span className="text-primary">Intel</span>
          </h2>
          <p className="text-foreground/50 mt-3 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
            <Zap className="w-4 h-4 text-success fill-success" /> Real-time network broadcasts
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {safeArray(globalPosts).slice(0, 3).map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <SellerPostCard
              post={{
                ...post,
                seller_id: post?.shops?.id,
                seller_name: post?.shops?.name,
                seller_location: post?.shops?.location,
                profile_image: post?.shops?.image_url
              }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
});
